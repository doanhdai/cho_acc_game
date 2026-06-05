package com.shopaccgame.repository;

import com.shopaccgame.model.Account;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class AccountRepositoryCustomImpl implements AccountRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public SearchResult searchAccounts(String category, String search, Double priceMin, Double priceMax, String rank, List<Integer> skinIds, String sort, String order, int page, int limit) {
        StringBuilder sql = new StringBuilder();
        StringBuilder countSql = new StringBuilder();

        sql.append("SELECT a.* FROM accounts a ");
        sql.append("JOIN categories c ON a.category_id = c.id ");

        countSql.append("SELECT COUNT(DISTINCT a.id) FROM accounts a ");
        countSql.append("JOIN categories c ON a.category_id = c.id ");

        boolean hasSkins = skinIds != null && !skinIds.isEmpty();
        if (hasSkins) {
            sql.append("JOIN account_skins ask ON a.id = ask.account_id ");
            countSql.append("JOIN account_skins ask ON a.id = ask.account_id ");
        }

        List<String> whereClauses = new ArrayList<>();
        whereClauses.add("a.status = 'SHOWING'");

        Map<String, Object> params = new HashMap<>();

        if (category != null && !category.trim().isEmpty()) {
            whereClauses.add("c.slug = :category");
            params.put("category", category);
        }
        if (search != null && !search.trim().isEmpty()) {
            whereClauses.add("MATCH(a.title, a.description) AGAINST(:search IN BOOLEAN MODE)");
            
            String[] words = search.trim().split("\\s+");
            StringBuilder ftQuery = new StringBuilder();
            for (String w : words) {
                if (!w.isEmpty()) {
                    // Filter out non-alphanumeric chars or characters that MySQL BOOLEAN mode treats as operators
                    String cleanWord = w.replaceAll("[+\\-*<>~()\"@]", "");
                    if (!cleanWord.isEmpty()) {
                        ftQuery.append("+").append(cleanWord).append("* ");
                    }
                }
            }
            params.put("search", ftQuery.toString().trim());
        }
        if (priceMin != null) {
            whereClauses.add("a.price >= :priceMin");
            params.put("priceMin", priceMin);
        }
        if (priceMax != null) {
            whereClauses.add("a.price <= :priceMax");
            params.put("priceMax", priceMax);
        }
        if (rank != null && !rank.trim().isEmpty()) {
            whereClauses.add("a.rank_level = :rank");
            params.put("rank", rank);
        }
        if (hasSkins) {
            whereClauses.add("ask.skin_id IN (:skinIds)");
            params.put("skinIds", skinIds);
        }

        if (!whereClauses.isEmpty()) {
            String whereStr = " WHERE " + String.join(" AND ", whereClauses);
            sql.append(whereStr);
            countSql.append(whereStr);
        }

        if (hasSkins) {
            sql.append(" GROUP BY a.id HAVING COUNT(DISTINCT ask.skin_id) = :skinIdsLength");
            params.put("skinIdsLength", skinIds.size());
        }

        // Sorting
        String validSort = "created_at";
        if ("price".equalsIgnoreCase(sort)) validSort = "price";
        else if ("view_count".equalsIgnoreCase(sort)) validSort = "view_count";
        String validOrder = "DESC".equalsIgnoreCase(order) ? "DESC" : "ASC";
        
        sql.append(" ORDER BY a.").append(validSort).append(" ").append(validOrder);

        // Pagination parameters
        int offset = (page - 1) * limit;

        // Build main query
        Query query = entityManager.createNativeQuery(sql.toString(), Account.class);
        // Build count query
        Query countQuery = entityManager.createNativeQuery(countSql.toString());

        // Set parameters
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
            countQuery.setParameter(entry.getKey(), entry.getValue());
        }

        // Apply pagination
        query.setFirstResult(offset);
        query.setMaxResults(limit);

        List<Account> accounts = query.getResultList();

        long totalCount = 0;
        if (hasSkins) {
            // If grouped by, count query needs to count the number of groups returned.
            // Using a subquery for accuracy.
            String subquerySql = "SELECT COUNT(*) FROM (" + sql.toString() + ") as group_subquery";
            Query subQuery = entityManager.createNativeQuery(subquerySql);
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                subQuery.setParameter(entry.getKey(), entry.getValue());
            }
            totalCount = ((Number) subQuery.getSingleResult()).longValue();
        } else {
            totalCount = ((Number) countQuery.getSingleResult()).longValue();
        }

        return new SearchResult(accounts, totalCount);
    }
}

package com.okgip.repository;

import com.okgip.entity.KnowledgeGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KnowledgeGapRepository extends JpaRepository<KnowledgeGap, Long> {
    List<KnowledgeGap> findByEmployeeId(Long employeeId);
    List<KnowledgeGap> findByEmployeeDepartmentId(Long departmentId);
}

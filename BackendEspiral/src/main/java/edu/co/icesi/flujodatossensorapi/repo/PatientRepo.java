package edu.co.icesi.flujodatossensorapi.repo;

import edu.co.icesi.flujodatossensorapi.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepo extends JpaRepository<Patient,Integer> {
    Optional<Patient> findByNationalId(String nationalId);
}

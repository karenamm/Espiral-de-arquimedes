package edu.co.icesi.flujodatossensorapi.repo;

import edu.co.icesi.flujodatossensorapi.entity.Sample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SampleRepo extends JpaRepository<Sample,Integer> {
    List<Sample> findByPatient_Id(int patientId);
}

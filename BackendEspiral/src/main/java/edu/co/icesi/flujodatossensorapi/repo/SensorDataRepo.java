package edu.co.icesi.flujodatossensorapi.repo;

import edu.co.icesi.flujodatossensorapi.entity.RawData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorDataRepo extends JpaRepository<RawData, Integer> {
    //List<RawData> findBySample_Id(int sampleId);
}

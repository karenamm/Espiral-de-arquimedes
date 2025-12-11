package edu.co.icesi.flujodatossensorapi.controller;

import edu.co.icesi.flujodatossensorapi.entity.RawData;
import edu.co.icesi.flujodatossensorapi.entity.Sample;
import edu.co.icesi.flujodatossensorapi.repo.SampleRepo;
import edu.co.icesi.flujodatossensorapi.repo.SensorDataRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://127.0.0.1:5500","http://localhost:4200","http://localhost:5173"})
public class RawDataController {

    @Autowired private SampleRepo sampleRepo;
    @Autowired private SensorDataRepo sensorDataRepo;

    @PostMapping("/samples/{sampleId}/raw")
    public ResponseEntity<?> addRaw(@PathVariable int sampleId, @RequestBody List<RawData> data) {
        Optional<Sample> opt = sampleRepo.findById(sampleId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Muestra no existe");
        }
        Sample s = opt.get();
        for (RawData rd : data) {
            rd.setSamples(s);
        }
        sensorDataRepo.saveAll(data);
        return ResponseEntity.status(201).body(data);
    }

    @GetMapping("/samples/{sampleId}/raw")
    public ResponseEntity<?> listRaw(@PathVariable int sampleId) {
        Optional<Sample> opt = sampleRepo.findById(sampleId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Muestra no existe");
        }
        return ResponseEntity.ok(opt.get().getSensorData());
    }

    @DeleteMapping("/raw/{id}")
    public ResponseEntity<?> deleteRaw(@PathVariable int id) {
        return sensorDataRepo.findById(id).map(r -> {
            sensorDataRepo.delete(r);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.status(404).body("RawData no existe"));
    }
}

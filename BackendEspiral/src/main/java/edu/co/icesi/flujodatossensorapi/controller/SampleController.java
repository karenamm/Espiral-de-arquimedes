package edu.co.icesi.flujodatossensorapi.controller;

import edu.co.icesi.flujodatossensorapi.entity.Patient;
import edu.co.icesi.flujodatossensorapi.entity.Sample;
import edu.co.icesi.flujodatossensorapi.repo.PatientRepo;
import edu.co.icesi.flujodatossensorapi.repo.SampleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/samples")
public class SampleController {

    @Autowired private SampleRepo sampleRepo;
    @Autowired private PatientRepo patientRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createSample(@RequestParam int patientId, @RequestBody(required = false) Sample sampleBody) {
        Optional<Patient> optionalPatient = patientRepo.findById(patientId);
        if (optionalPatient.isEmpty()) {
            return ResponseEntity.status(404).body("Paciente no encontrado con ID: " + patientId);
        }

        Patient patient = optionalPatient.get();
        Sample sample = (sampleBody != null) ? sampleBody : new Sample();
        if (sample.getTimestamp() == 0L) sample.setTimestamp(new Date().getTime());
        if (sample.getSamplingRate() == 0.0) sample.setSamplingRate(20.0);
        sample.setPatient(patient);
        sampleRepo.save(sample);

        return ResponseEntity.ok(sample);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllSamples() {
        List<Sample> samples = sampleRepo.findAll();
        return ResponseEntity.ok(samples);
    }

    @GetMapping("/by-patient/{patientId}")
    public ResponseEntity<?> listByPatient(@PathVariable int patientId) {
        return ResponseEntity.ok(sampleRepo.findByPatient_Id(patientId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSample(@PathVariable int id) {
        if (!sampleRepo.existsById(id)) return ResponseEntity.status(404).body("Muestra no encontrada");
        sampleRepo.deleteById(id);
        return ResponseEntity.ok("Muestra eliminada");
    }
}

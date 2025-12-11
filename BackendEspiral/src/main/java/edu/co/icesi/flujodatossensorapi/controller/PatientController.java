package edu.co.icesi.flujodatossensorapi.controller;

import edu.co.icesi.flujodatossensorapi.entity.Patient;
import edu.co.icesi.flujodatossensorapi.repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/patients")
public class PatientController {
    @Autowired
    private PatientRepo patientRepo;

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return patientRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Paciente no encontrado"));
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllPatients(){
        List<Patient> patients = patientRepo.findAll();
        return ResponseEntity.ok(patients);
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody Patient patient) {
        patientRepo.save(patient);
        return ResponseEntity.ok(patient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable int id) {
        if (patientRepo.existsById(id)) {
            patientRepo.deleteById(id);
            return ResponseEntity.ok("Paciente eliminado correctamente");
        } else {
            return ResponseEntity.status(404).body("Paciente no encontrado");
        }
    }
}

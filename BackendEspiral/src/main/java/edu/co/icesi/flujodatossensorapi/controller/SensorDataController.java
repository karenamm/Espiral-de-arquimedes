package edu.co.icesi.flujodatossensorapi.controller;

import edu.co.icesi.flujodatossensorapi.entity.Patient;
import edu.co.icesi.flujodatossensorapi.entity.RawData;
import edu.co.icesi.flujodatossensorapi.entity.Sample;

import edu.co.icesi.flujodatossensorapi.repo.PatientRepo;
import edu.co.icesi.flujodatossensorapi.repo.SampleRepo;
import edu.co.icesi.flujodatossensorapi.repo.SensorDataRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class SensorDataController {

    @Autowired
    private SensorDataRepo sensorDataRepo;

    @Autowired
    private SampleRepo sampleRepo;

    @Autowired
    private PatientRepo patientRepo;

    @PostMapping("sensor")
    public ResponseEntity<?> addSensorData(@RequestBody RawData sensorData) {
        sensorDataRepo.save(sensorData);
        return ResponseEntity.status(200).body(sensorData);
    }

    @PostMapping("sensors")
    public ResponseEntity<?> addSensorData(@RequestBody List<RawData> sensorData) {

        // Paciente
        Patient patient = new Patient();
        patient.setName("SANTIAGO");
        patient.setLastName("GOMEZ");
        patient.setNationalId("1114309030");

        Optional<Patient> dbPatient = patientRepo.findByNationalId(patient.getNationalId());
        if (dbPatient.isEmpty()) {
            patientRepo.save(patient);
        } else {
            patient = dbPatient.get();
        }

        Sample sample = new Sample();
        sample.setSamplingRate(20.0);
        sample.setTimestamp(new Date().getTime());
        sample.setPatient(patient);

        sampleRepo.save(sample);

        for (RawData data : sensorData) {
            data.setSamples(sample);
        }
        sensorDataRepo.saveAll(sensorData);

        return ResponseEntity.status(200).body("Datos guardados");
    }


    @PostMapping("saveSensorRawData")
    public ResponseEntity<?> saveSensorRawData(@RequestBody List<RawData> sensorData) {
        sensorDataRepo.saveAll(sensorData);
        return ResponseEntity.status(200).body(sensorData);
    }

    @GetMapping("/sample/{identificador}")
    public ResponseEntity<?> getMeasurement(@PathVariable("identificador") int identificador) {
        Optional<Sample> sampleDb = sampleRepo.findById(identificador);

        if (sampleDb.isPresent()) {
            return ResponseEntity.status(200).body(sampleDb.get());
        } else {
            return ResponseEntity.status(404).body("El identificador no existe");
        }
    }

    @GetMapping("/getAllSamples")
    public ResponseEntity<?> getAllSamples() {
        List<Sample> samples = sampleRepo.findAll();
        return ResponseEntity.status(200).body(samples);
    }

    //http://192.168.131.177:8080/hello
    @GetMapping("/hello")
    public ResponseEntity<?> healthCheck(){
        return ResponseEntity.status(200).body("hello world");
    }

}

/*
 *  ENDPOINTS:
 *
 * 1) POST /sensor
 *    ➝ Recibe un solo objeto RawData (valores de giroscopio/acelerómetro).
 *    ➝ Lo guarda en la base de datos usando sensorDataRepo.save().
 *    ➝ Retorna el objeto guardado con status 200 OK.
 *
 * 2) POST /sensors
 *    ➝ Recibe una lista de RawData (varias lecturas del sensor).
 *    ➝ Verifica si el paciente (ID fijo: "1114309030") ya existe:
 *         - Si no existe, lo crea en la base de datos.
 *         - Si existe, lo reutiliza.
 *    ➝ Crea una nueva muestra (Sample) con frecuencia = 20 Hz y timestamp actual.
 *    ➝ Asocia todos los RawData de la lista a esa muestra.
 *    ➝ Guarda el Sample y todos los RawData en la base de datos.
 *    ➝ Retorna el mensaje "Datos guardados" con status 200 OK.
 *
 *
 * 3) POST /saveSensorRawData
 *    ➝ Recibe una lista de RawData sin asociarla a Sample ni Patient.
 *    ➝ Guarda todos los registros directamente con sensorDataRepo.saveAll().
 *    ➝ Devuelve la lista de datos guardados con status 200 OK.
 *
 * 4) GET /sample/{identificador}
 *    ➝ Recibe el ID de una muestra en la URL.
 *    ➝ Busca el Sample en la BD usando sampleRepo.findById().
 *         - Si existe, devuelve el objeto Sample con status 200 OK.
 *         - Si no existe, devuelve un 404 Not Found con el mensaje "El identificador no existe".
 *    ➝ Tiene habilitado @CrossOrigin(origins = "http://127.0.0.1:5500") para permitir peticiones desde un frontend local.
 *
 */

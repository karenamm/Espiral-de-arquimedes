package edu.co.icesi.flujodatossensorapi.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "sample")
public class Sample {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private double samplingRate;
    private long timestamp;

    @OneToMany(mappedBy = "samples", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RawData> sensorData;

    @ManyToOne
    @JoinColumn(name = "patientId")
    private Patient patient;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public double getSamplingRate() { return samplingRate; }
    public void setSamplingRate(double samplingRate) { this.samplingRate = samplingRate; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public List<RawData> getSensorData() { return sensorData; }
    public void setSensorData(List<RawData> sensorData) { this.sensorData = sensorData; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
}

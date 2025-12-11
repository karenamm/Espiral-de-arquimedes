package edu.co.icesi.flujodatossensorapi.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "rawdata")
public class RawData {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private double gx;
    private double gy;
    private double gz;
    private double ax;
    private double ay;
    private double az;

    @ManyToOne
    @JoinColumn(name = "sampleid")
    @JsonBackReference("sample-raw")
    private Sample samples;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public double getGx() { return gx; }
    public void setGx(double gx) { this.gx = gx; }

    public double getGy() { return gy; }
    public void setGy(double gy) { this.gy = gy; }

    public double getGz() { return gz; }
    public void setGz(double gz) { this.gz = gz; }

    public double getAx() { return ax; }
    public void setAx(double ax) { this.ax = ax; }

    public double getAy() { return ay; }
    public void setAy(double ay) { this.ay = ay; }

    public double getAz() { return az; }
    public void setAz(double az) { this.az = az; }

    public Sample getSamples() { return samples; }
    public void setSamples(Sample samples) { this.samples = samples; }
}

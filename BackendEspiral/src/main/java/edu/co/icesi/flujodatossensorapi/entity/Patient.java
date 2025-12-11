package edu.co.icesi.flujodatossensorapi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "patient")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String Name;
    private String lastName;

    @Column(nullable = false)
    private String nationalId;

    @Column(length = 1000)
    private String imageUrl;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Sample> samples;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return Name; }
    public void setName(String name) { this.Name = name; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<Sample> getSamples() { return samples; }
    public void setSamples(List<Sample> samples) { this.samples = samples; }
}

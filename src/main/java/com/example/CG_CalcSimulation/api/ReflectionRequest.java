package com.example.CG_CalcSimulation.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReflectionRequest {
    @JsonProperty("a")
    private Double a;
    @JsonProperty("b")
    private Double b;
    @JsonProperty("c")
    private Double c;

    public ReflectionRequest() {
    }

    public Double getA() {
        return a;
    }

    public void setA(Double a) {
        this.a = a;
    }

    public Double getB() {
        return b;
    }

    public void setB(Double b) {
        this.b = b;
    }

    public Double getC() {
        return c;
    }

    public void setC(Double c) {
        this.c = c;
    }
}

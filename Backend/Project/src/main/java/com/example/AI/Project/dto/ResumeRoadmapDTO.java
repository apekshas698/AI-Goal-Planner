package com.example.AI.Project.dto;

public class ResumeRoadmapDTO {

    private String target;
    private String dsaRoadmap;
    private String systemDesignRoadmap;
    private String projectsRoadmap;
    private String csFundamentalsRoadmap;

    public ResumeRoadmapDTO() {}

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getDsaRoadmap() { return dsaRoadmap; }
    public void setDsaRoadmap(String dsaRoadmap) { this.dsaRoadmap = dsaRoadmap; }

    public String getSystemDesignRoadmap() { return systemDesignRoadmap; }
    public void setSystemDesignRoadmap(String systemDesignRoadmap) { this.systemDesignRoadmap = systemDesignRoadmap; }

    public String getProjectsRoadmap() { return projectsRoadmap; }
    public void setProjectsRoadmap(String projectsRoadmap) { this.projectsRoadmap = projectsRoadmap; }

    public String getCsFundamentalsRoadmap() { return csFundamentalsRoadmap; }
    public void setCsFundamentalsRoadmap(String csFundamentalsRoadmap) { this.csFundamentalsRoadmap = csFundamentalsRoadmap; }
}
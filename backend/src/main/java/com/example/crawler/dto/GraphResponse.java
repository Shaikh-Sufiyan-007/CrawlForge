package com.example.crawler.dto;

import java.util.ArrayList;
import java.util.List;

public class GraphResponse {

    private List<NodeDto> nodes = new ArrayList<>();
    private List<EdgeDto> edges = new ArrayList<>();

    public GraphResponse() {
    }

    public GraphResponse(List<NodeDto> nodes, List<EdgeDto> edges) {
        this.nodes = nodes != null ? nodes : new ArrayList<>();
        this.edges = edges != null ? edges : new ArrayList<>();
    }

    public List<NodeDto> getNodes() {
        return nodes;
    }

    public void setNodes(List<NodeDto> nodes) {
        this.nodes = nodes;
    }

    public List<EdgeDto> getEdges() {
        return edges;
    }

    public void setEdges(List<EdgeDto> edges) {
        this.edges = edges;
    }

    public static class NodeDto {
        private String id;
        private String label;
        private Integer statusCode;
        private Integer depth;

        public NodeDto() {
        }

        public NodeDto(String id, String label, Integer statusCode, Integer depth) {
            this.id = id;
            this.label = label;
            this.statusCode = statusCode;
            this.depth = depth;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public Integer getStatusCode() {
            return statusCode;
        }

        public void setStatusCode(Integer statusCode) {
            this.statusCode = statusCode;
        }

        public Integer getDepth() {
            return depth;
        }

        public void setDepth(Integer depth) {
            this.depth = depth;
        }
    }

    public static class EdgeDto {
        private String id;
        private String source;
        private String target;
        private Boolean internal;

        public EdgeDto() {
        }

        public EdgeDto(String id, String source, String target, Boolean internal) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.internal = internal;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }

        public Boolean getInternal() {
            return internal;
        }

        public void setInternal(Boolean internal) {
            this.internal = internal;
        }
    }
}

# PlasmaPing

**Team PandoraX**
* J M Tarun
* Srilekha R
* Abhinaya S
* Aswin Raaj P S

---

### 🎥 Demonstration Video
[https://www.youtube.com/watch?v=5uTQRYRB5MY]

---

## 🛰️ Project Description

PlasmaPing is a next-generation, CubeSat-compatible debris detection system designed to identify previously invisible space debris in the 1–10 cm range, a critical gap in current space situational awareness.

## 🚀 Problem Statement

Earth’s orbit is increasingly congested.

* Over 27,000 objects are actively tracked
* More than 500,000 debris fragments between 1–10 cm remain untracked

At orbital velocities of 7–10 km/s, even a 1 cm fragment can cause catastrophic damage to satellites. Existing systems fail to address this:

* **Radar systems** cannot reliably detect objects below ~10 cm
* **Optical systems** depend on lighting and line-of-sight
* **Onboard sensors** detect debris only after impact

This creates a critical blind spot, increasing the risk of cascading collisions, also known as Kessler syndrome.

## 💡 Our Solution

PlasmaPing introduces a passive, disturbance-based sensing architecture that enables detection of small debris objects using low-power CubeSat payloads.

Instead of relying on reflected signals like radar, PlasmaPing detects disturbances in a surrounding field caused by moving objects.

## ⚙️ Core Concept (First Principles)

When an object moves through a medium, it creates a disturbance:

* **In water** → a wake behind a boat
* **In air** → turbulence behind an aircraft
* **In plasma** → electromagnetic and charge disturbances

In low Earth orbit, the ionosphere is filled with charged particles (plasma). A fast-moving debris object:

1. Disrupts local electron density
2. Creates a plasma wake
3. Generates measurable electromagnetic fluctuations

PlasmaPing is designed to detect these disturbances passively, without transmitting any signal.

## 🧪 Ground Validation (RF Analog)

Since ionospheric plasma cannot be replicated in a lab, PlasmaPing uses a forward-scatter RF testbed as a physical analog.

In this setup:

* A transmitter emits a continuous RF signal
* A receiver monitors the signal
* When an object passes through the signal path, it causes:
    * Amplitude dips
    * Frequency shifts (Doppler-like)
    * Temporal disturbances

This validates the same principle: **Detection based on disturbance, not reflection**.

## 🧠 System Architecture

PlasmaPing is built as a sensor-agnostic pipeline, enabling seamless transition from RF testing to plasma sensing in orbit.

### Pipeline Overview
* **Sensor Adapter**: Captures raw signal data (RF or plasma) and standardizes it.
* **Stream Processing**: Converts signal into spectrogram using FFT.
* **Anomaly Detection**: Identifies disturbances using baseline deviation.
* **Feature Extraction**: Computes:
    * Amplitude drop
    * Doppler shift
    * Duration
    * Bandwidth
    * Signal-to-noise ratio
* **Classification**: Estimates:
    * Object size class
    * Velocity
* **Orbit Engine**: Generates physically consistent orbital trajectories.
* **Risk Assessment**: Computes closest approach to active satellites such as the International Space Station.
* **Visualization Dashboard**: Displays real-time detection, trajectory, and risk.

## 🛰️ CubeSat Deployment Vision

PlasmaPing is designed for 1U CubeSat integration, with key advantages:

* **Passive sensing** → ultra-low power (<3 W)
* **Compact payload** → fits within CubeSat constraints
* **Distributed deployment** → multiple satellites form a detection network

Each CubeSat acts as a sensing node, transmitting detection events to ground systems or other satellites.

## 🌐 Real-World Application

PlasmaPing enables:

* Detection of previously invisible debris
* Early warning for collision avoidance
* Contribution to a global “dark debris catalog”
* Enhanced space traffic management

Rather than reacting after collisions, PlasmaPing enables proactive risk mitigation.

## 🔬 Novelty

PlasmaPing’s innovation lies in system integration and application:

* **Disturbance-based detection approach**: Moves beyond reflection-based sensing
* **Passive, low-power architecture**: Suitable for CubeSat deployment
* **Sensor-agnostic pipeline**: Works across RF testbeds and plasma environments
* **End-to-end system**: From detection → classification → orbit modeling → risk analysis

No existing open system combines all these elements for sub-10 cm debris detection.

## 📊 Key Outcomes

* Real-time detection of disturbance events
* Estimation of object size and velocity
* Simulated orbital trajectory generation
* Collision risk visualization

## 🔮 Future Scope

* Integration with plasma sensors for in-orbit deployment
* Multi-satellite constellation for triangulation and tracking
* AI-based multi-object detection and filtering
* Integration with global tracking systems and space agencies

## 🧩 Summary

PlasmaPing redefines debris detection by shifting from seeing objects to sensing their impact on the environment.

It is not just a sensor, but a complete detection and intelligence system, designed to operate within the constraints of small satellites while addressing one of the most critical unsolved challenges in space.

---

## 💻 Running the Dashboard Locally

This repository contains the interactive mission control dashboard for PlasmaPing, built with **React, Vite, and TailwindCSS**. 

### Prerequisites
* Ensure you have [Bun](https://bun.sh/) installed on your machine.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd plasma-orbit-watch
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start the development server:**
   ```bash
   bun run dev
   ```

4. **View the app:**
   Open your browser and navigate to `http://localhost:8080` (or the port specified in your terminal) to view the live simulation.

---
title: "Submarine Cables as Underwater Acoustic Receivers"
subtitle: "A look back at our DAS underwater communication field experiment"
summary: "Why the 2021 IEEE Sensors Journal paper on distributed acoustic sensing underwater communications became a useful reference point for submarine-cable-based ocean telemetry."
authors:
- admin
tags:
- Distributed acoustic sensing
- Underwater acoustic communication
- Submarine cables
- Ocean Internet of Things
categories:
- Research
date: "2026-06-29T00:00:00Z"
lastmod: "2026-06-29T00:00:00Z"
featured: false
draft: false
---

Underwater acoustic communication is usually built around a difficult compromise: a mobile underwater platform needs to send data over long distances, but acoustic propagation is bandwidth-limited, power-hungry, and highly sensitive to the channel. In the open ocean, this problem becomes even sharper because conventional relay infrastructure, such as surface buoys or seabed hydrophones, can be expensive, sparse, or simply unavailable.

Our 2021 paper, [*Channel Distribution and Noise Characteristics of Distributed Acoustic Sensing Underwater Communications*](https://doi.org/10.1109/JSEN.2021.3115581), explored a different possibility: using submarine optical cables equipped with distributed acoustic sensing (DAS) as large-aperture underwater acoustic receivers. As of June 29, 2026, Google Scholar lists it as my most-cited paper, with 21 citations.

The key idea is simple but powerful. A DAS system turns a long optical fiber into a dense sensing array. When an underwater transmitter emits an acoustic signal, the cable does not merely carry data as an optical link; it can also sense acoustic perturbations along its length. This makes it possible to imagine a communication architecture where existing or purpose-built submarine cables help receive data from underwater vehicles and sensors.

The paper focused on two practical questions that matter before such a system can become useful in engineering:

1. What does the DAS underwater acoustic channel look like?
2. What kind of background noise should communication waveforms be designed against?

Based on field measurements with an armored optical cable, we analyzed the channel distribution and noise characteristics of the system. One result was that the envelope amplitudes of the impulse responses followed a Burr distribution. We also observed that adjacent sensing segments could influence received signals, producing multiple arrivals within an acoustic bounce. These are not small implementation details; they affect equalization, synchronization, and how robust a communication receiver must be.

The noise results were equally important. Below 1 kHz, the measured DAS noise showed behavior that differed from the classical Wenz noise spectrum often used to describe ocean ambient noise from shipping and wind. The noise was strongly shaped by the equipment and cable system itself, and it exhibited full-band fluctuations. For underwater communication design, that means the receiver should not assume a smooth, textbook-like noise background.

What I still like about this work is that it sits at the boundary between communication theory and marine infrastructure. It does not treat the ocean as a clean channel model, and it does not treat submarine cables as passive objects. Instead, it asks what happens when sensing, communication, and existing ocean infrastructure are considered together.

That direction has continued to shape my later work on cross-medium links, submarine-cable telemetry, and ocean Internet of Things systems. The broader lesson is that a future ocean network may not be built only by deploying more standalone nodes. It may also emerge by making better use of infrastructure that is already stretched across the seafloor.

Sources and related pages:

- Paper DOI: <https://doi.org/10.1109/JSEN.2021.3115581>
- Google Scholar profile: <https://scholar.google.com/citations?hl=en&user=KvxU4p4AAAAJ>
- ResearchGate profile: <https://www.researchgate.net/profile/Shaojian-Yang>

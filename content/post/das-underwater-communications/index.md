---
title: "Receiverless Underwater Telemetry with Submarine Cables"
subtitle: "From a DAS channel study to an infrastructure-free AUV communication architecture"
summary: "How my 2021 DAS underwater communication paper fits into the broader PhD dissertation problem: enabling AUV data return when conventional receiving infrastructure is absent."
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
image:
  caption: "Research framework of my PhD dissertation."
  focal_point: "Center"
  preview_only: false
---

Underwater acoustic communication is often discussed as a problem of bandwidth, propagation loss, multipath, or Doppler spread. Those are real problems, but my doctoral dissertation starts from an even more basic one: in many ocean scenarios, the receiver itself is missing.

Autonomous underwater vehicles (AUVs) can collect valuable data during ecological surveys, environmental monitoring, deep-sea exploration, and subsea infrastructure inspection. Yet the value of that data depends on whether it can return to shore while the mission is still alive. In remote oceans, deep water, polar regions, or surface-restricted areas, conventional receiving infrastructure such as relay buoys, ships, seabed hydrophones, and cabled base stations may be too expensive, too visible, too fragile, or simply unavailable.

That changes the nature of the communication problem. It is not only a question of how fast a modem can transmit. It is a question of whether a usable receiving path exists at all.

My PhD dissertation, *Research on Underwater Acoustic Communications Based on Unconventional Receivers for Data Backhaul*, framed this as a "receiverless" or "receiver-infrastructure-limited" telemetry problem. The work explored two unconventional receiving routes:

1. An airborne microphone on an unmanned aerial vehicle receiving underwater acoustic signals after they pass through the water-air interface.
2. A submarine optical-electric cable, interrogated by distributed acoustic sensing (DAS), acting as a distributed underwater acoustic receiver.

This post focuses on the second route, because it connects directly to my most-cited paper as of June 29, 2026: [*Channel Distribution and Noise Characteristics of Distributed Acoustic Sensing Underwater Communications*](https://doi.org/10.1109/JSEN.2021.3115581), which Google Scholar lists with 21 citations. The paper was an early step in answering a practical question: can a submarine cable be more than a communication pipe? Can it become an acoustic receiving infrastructure for AUV data return?

The core idea is to repurpose the cable. A DAS system sends coherent optical pulses into a fiber and measures the phase changes in Rayleigh backscatter. External acoustic waves cause tiny strain perturbations along the cable, and those perturbations appear in the returned optical signal. In effect, a long fiber becomes a dense line of sensing channels. If an AUV transmits an acoustic packet near the cable, the shore station may be able to recover that packet without deploying a hydrophone at the seafloor.

This is attractive because submarine communication cables already span large ocean regions. Many cables include unused fibers, often called dark fibers. If a shore station can connect a DAS interrogator to such a fiber, the cable can become a passive, distributed acoustic receiving array while remaining physically continuous, covert, and low-maintenance.

But this architecture only becomes useful if the channel is understood. In Chapter 4 of my dissertation, I modeled the path from underwater acoustic emission to DAS observation as a cascade:

- acoustic propagation in water,
- coupling through the seafloor or cable environment,
- mechanical response of the cable,
- conversion of cable strain into optical phase variation.

This means the received DAS signal is not the same as the pressure waveform that a hydrophone would record. It is the result of a coupled water-sediment-cable-fiber system. Multipath still matters, but so do cable structure, adjacent sensing sections, gauge length, pulse repetition frequency, and the way vibration travels along the cable.

The 2021 field experiment measured this channel with a lightweight protected armored optical-electric cable in Mulan Lake. The transmitter was mounted from a boat, with the transducer placed about 2 m below the surface. The cable lay on the lakebed and was connected to a shore-based DAS device. We tested multiple acoustic waveforms, including LFM, BASK, MFSK, QPSK, and OFDM signals, at distances ranging from 1 m to 1000 m.

Several observations from that study have stayed important in my later work.

First, the DAS channel statistics were not well described by the simple assumptions one might borrow from a conventional acoustic receiver. The envelope amplitudes of the measured impulse responses were better fitted by a Burr distribution than by Rayleigh or normal distributions. The sound source position relative to the cable also changed the distribution. When the source moved closer to the cable's overhead region, the received energy became more concentrated.

Second, adjacent cable sections were not independent. In an idealized DAS receiver, one might imagine each spatial segment as a clean channel. In practice, vibration can couple through neighboring sections, and the signal recorded at one segment can contain contributions from nearby cable portions. This creates additional arrivals and affects the effective channel delay spread. In QPSK measurements, the estimated maximum delays were about 9.9 to 13.8 ms, with roughly 12 to 14 effective taps across different measurement times.

Third, the noise was not just ocean noise. Compared with the classical Wenz noise picture of wind and shipping contributions, the DAS background showed its own spectral structure. Below 1 kHz, the measured DAS noise power spectral density decreased at about 18 dB per octave, a behavior mainly shaped by the equipment and cable system. The noise also fluctuated across time, frequency, and sensing channels. For modem design, this matters: the receiver should not be tuned only for a textbook hydrophone noise model.

The dissertation then pushed this idea beyond channel measurement. Chapter 5 asked what a complete AUV communication loop might look like if the submarine cable itself became part of the communication infrastructure.

For the uplink, the answer was acoustic-to-optical: the AUV transmits an acoustic signal, the cable senses it through DAS, and the shore station demodulates it. In a lake-trial uplink system, a QPSK signal at a 5 kHz carrier occupied about 3660 Hz of bandwidth and achieved an effective packet data rate of about 2628 bps. The DAS received signal had much lower SNR than a nearby hydrophone in the same experiment, but it still carried recoverable communication data. That is the engineering point: the cable did not need to behave like an ideal hydrophone to be useful.

For the downlink, the dissertation introduced a complementary magnetic route using the copper conductor in an optical-electric submarine cable. A shore station injects a modulated low-frequency current into the cable, creating a magnetic field near the cable. A high-sensitivity NV-center diamond magnetometer can detect that field underwater and recover low-rate commands. In the sea trial, an MFSK downlink used 16 tones from 27 Hz to 477 Hz, with a symbol duration of 0.5 s, achieving about 7.2 bps. That rate is modest, but it is enough for low-rate command delivery, status updates, or parameter configuration.

Together, the DAS uplink and magnetic downlink form a heterogeneous cable-assisted communication loop:

- acoustic-optical coupling for data return from AUV to shore,
- electric-magnetic coupling for command delivery from shore to AUV.

The broader lesson is that underwater communication does not have to rely only on deploying more standalone receivers. In some scenarios, it may be more practical to reinterpret existing infrastructure as part of the communication medium. A submarine cable can be a data pipe, a sensor, a receiver array, a magnetic transmitter, and a physical reference line for underwater systems.

That is why the 2021 DAS channel paper became an important reference point in my research. It did not solve the entire AUV telemetry problem by itself. Instead, it clarified the first layer of the problem: what the cable hears, how it hears, and what kind of noise and channel structure a communication receiver must confront. The later dissertation work built on that foundation to show a more complete architecture for infrastructure-free or infrastructure-limited ocean telemetry.

For me, this direction remains compelling because it shifts the design question from "How do we deploy a receiver everywhere?" to "What can already receive, if we learn how to listen?"

Sources and related pages:

- Paper DOI: <https://doi.org/10.1109/JSEN.2021.3115581>
- PhD dissertation source: Chapters 1, 4, and 5 of my doctoral thesis
- Google Scholar profile: <https://scholar.google.com/citations?hl=en&user=KvxU4p4AAAAJ>
- ResearchGate profile: <https://www.researchgate.net/profile/Shaojian-Yang>

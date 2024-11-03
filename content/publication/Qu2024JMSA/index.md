---
title: "Iterative Sequence Detection Combined with Channel Shortening and Sphere Decoding in Underwater Acoustic Communications"
authors:
- Fengzhong Qu
- Hao Fang
- Xingbin Tu
- Yan Wei
- Minhao Zhang
- admin
author_notes:
- ""
- ""
- "Corresponding Author"
- ""
- ""
- ""
date: "2023-03-20T00:00:00Z"
doi: "10.1007/s11804-024-00387-5"

# Schedule page publish date (NOT publication's date).
publishDate: "2024-01-20T00:00:00Z"

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ["article-journal"]

# Publication name and optional abbreviated publication name.
publication: "*Journal of Marine Science and Application*, 23, 238–246 (2024)"
publication_short: ""

abstract: The demand for high-data-rate underwater acoustic communications (UACs) in marine development is increasing; however, severe multipaths make demodulation a challenge. The decision feedback equalizer (DFE) is one of the most popular equalizers in UAC; however, it is not the optimal algorithm. Although maximum likelihood sequence estimation (MLSE) is the optimal algorithm, its complexity increases exponentially with the number of channel taps, making it challenging to apply to UAC. Therefore, this paper proposes a complexity-reduced MLSE to improve the bit error rate (BER) performance in multipath channels. In the proposed algorithm, the original channel is first shortened using a channel-shortening method, and several dominant channel taps are selected for MLSE. Subsequently, sphere decoding (SD) is performed in the following MLSE. Iterations are applied to eliminate inter-symbol interference caused by weak channel taps. The simulation and sea experiment demonstrate the superiority of the proposed algorithm. The simulation results show that channel shortening combined with SD can drastically reduce computational complexity, and iterative SD performs better than DFE based on recursive least squares (RLS-DFE), DFE based on improved proportionate normalized least mean squares (IPNLMS-DFE), and channel estimation-based DFE (CE-DFE). Moreover, the sea experimental results at Zhairuoshan Island in Zhoushan show that the proposed receiver scheme has improved BER performance over RLS-DFE, IPNLMS-DFE, and CE-DFE. Compared with the RLS-DFE, the BER, after five iterations, is reduced from 0.007 6 to 0.003 7 in the 8–12 kHz band and from 0.151 6 to 0.114 5 in the 13–17 kHz band at a distance of 2 000 m. Thus, the proposed algorithm makes it possible to apply MLSE in UAC in practical scenarios.





# Summary. An optional shortened abstract.
# summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis posuere tellus ac convallis placerat. Proin tincidunt magna sed ex sollicitudin condimentum.

tags:
- Underwater acoustic communications (UACs)
- Maximum likelihood sequence estimation (MLSE)
- Channel shortening
- Sphere decoding (SD)
- Iterative detection
featured: false

# links:
# - name: ""
#   url: ""
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: ""
---

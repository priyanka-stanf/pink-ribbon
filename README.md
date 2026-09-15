# PinkRibbon

**Live demo: https://pinkribbon.vercel.app**

A patient-facing simulator for breast cancer treatment planning. Built at TreeHacks 2026.

## Inspiration
Nearly 40% of women with breast cancer regret their treatment decisions within five years. Why? Because outcomes can vary based on tumor type, stage, and individual risk factors, which patients rarely get to see or understand before deciding on a treatment plan. 

Current tools focus on isolated outcomes, not entire personalized care trajectories. They don’t capture uncertainty, side effects, or cost considerations, and they don’t connect treatment decisions to the real hospitals delivering care.

We built PinkRibbon to provide patients with a holistic understanding of their treatment pathways, factoring in not only the potential for recurrence, but also the other nuances of their medical decision, including pricing information and potential side effects. Our platform brings transparency, grounded in data, to complex treatment choices, directly empowering our users to understand their risks, weigh their options, and advocate for the breast cancer care that’s right for them.


## What it does

PinkRibbon is a patient-facing simulator for breast cancer treatment planning.
The patient enters their relevant data and health records, and PinkRibbon is able to:\
-Determine which breast cancer treatment pathways a patient is eligible for\
-Locally run 5,000 Monte Carlo simulations by repeatedly sampling plausible values for baseline 5-year recurrence risk (based on stage/subtype) and treatment effect size (hazard ratio), computing a treated recurrence risk each time, then summarizing the 5,000 outcomes as a recurrence range (with confidence bounds) instead of a single estimate\
-Provide the patient with a visualization of their potential treatment plans, highlighting the one with the lowest probability of cancer recurrence\
-For that highlighted treatment path, PinkRibbon will provide the patient with information on what to expect from the treatment and recovery, genuine reassurance, and potential tools to further support their mental and physical health\
-Find treatment centers within a patient’s zip code and display each on a map inside the platform, alongside their rating and cost efficiency, which is pulled from CMS data\
-Allow users to compare hospitals in their area, with PinkRibbon recommending the best fit based off of a patient’s preferences on the importance of rating and cost\
PinkRibbon also models other data about the hospitals under comparison, like their mortality, safety of care, and readmission rate.


## How we built it
PinkRibbon was built as a full-stack, simulation-driven web application designed to model personalized breast cancer treatment trajectories in real time.
On the backend, we used FastAPI (Python) to build a high-performance API capable of handling clinical input processing and simulation requests efficiently. Our core simulation engine leverages NumPy + SciPy to run large-scale Monte Carlo simulations, generating recurrence distributions rather than single-point estimates.
The model operates on a modular parameter system grounded in real-world data sources, including SEER epidemiology for population-level recurrence statistics, PubMed RCT and meta-analysis hazard ratios to adjust risk by treatment type and stage, and CMS cost distributions to estimate financial impact. This architecture allows us to dynamically compute mean recurrence, standard deviation (capturing uncertainty), major side effect probabilities, and median cost for each treatment pathway.
On the frontend, we built an interactive interface using React + TypeScript to ensure type safety and scalability. We styled components with Material UI, Radix UI, and Tailwind CSS, balancing accessibility with rapid iteration during the hackathon.
To make uncertainty intuitive, we used Recharts to visualize recurrence distributions and comparative outcome metrics. For geographic transparency, we integrated Leaflet + React-Leaflet to render hospital-level maps, connecting treatment decisions to real-world care environments. Communication between the frontend and backend is handled via Axios, enabling seamless API calls and real-time simulation updates.
By combining probabilistic modeling, evidence-grounded clinical parameters, and a carefully designed user interface, PinkRibbon transforms complex oncology data into personalized, understandable insight—bridging the gap between statistical risk and real patient decision-making.

Backend
FastAPI (Python)


NumPy + SciPy for Monte Carlo simulations


Modular parameter system grounded in:


SEER epidemiology


PubMed RCT/meta-analysis hazard ratios


CMS cost distributions


Frontend
React + TypeScript


Material UI + Radix UI


Tailwind CSS


Recharts for distribution visualization


Leaflet + React-Leaflet for hospital map


Axios for API communication

Modeling approach: We represent each treatment plan as a step-by-step pathway (therapy → surgery → radiation → follow-up), sample delays/complications probabilistically, then aggregate outcomes into distributions.


Evidence layer: We used research summaries and published clinical references to set reasonable default parameter ranges and kept assumptions visible in the UI.







## Challenges we ran into

Dealing with APIs for the first time: The majority of our team had little to no experience integrating APIs into projects, so there was a steep learning curve there.

Credible modeling under hackathon time: Real outcomes depend on many clinical variables. We focused on a simple but defensible model rather than pretending we could be perfect.

Dealing with Git and version control: Trying to merge code from 4 different people on different branches was something we didn’t have experience with, and there were definitely a few near-scares about code being lost!

Handling nuance of a medical product: It’s easy to accidentally make something that feels like “medical advice.” We had to design the UI and language very carefully with things like distributions, uncertainty, and clear disclaimers.

## Accomplishments that we're proud of

Extending topics from our CS109: Probability for Computer Scientists course to explore real-world applications of probability–in this case, through implementation of the Monte Carlo simulation

Racing through the last 36 hours, building and debugging code to build a fully functional implementation of our project idea with little to no hackathon experience

As newcomers to the hackathon environment, this whole experience was very fresh to us, but it was very fulfilling to see this project through from beginning to end and its potential social impact.

Implemented a variance explainer so the product doesn’t just show numbers - it explains what drives them, so it’s not just a black box.

Kept the project grounded and responsible: transparent assumptions and local storage

The map in particular was a really cool feature to implement for us!


## What we learned
Using Monte Carlo simulation to convert clinical uncertainty into measurable distributions, rather than single averages, allowed us to model recurrence, cost variability, and toxicity risk as real ranges of outcomes instead of fixed num
Choosing depth over breadth to ensure that our product was fully functional and valid before adding anything new, ensuring reliability and clarity rather than feature overload.
Looking at how each breast cancer treatment works, how hazard ratios modify baseline recurrence risk, and how side effects persist, which allowed us to build an accurate model
Treating data provenance as part of the engineering process, ensuring every parameter is traced back to SEER, CMS, NCCN-aligned logic, or published clinical trials rather than unverified assumptions.





## What's next for PinkRibbon

Expand to more breast cancer subtypes and add richer clinical inputs (with careful privacy-by-design).

Incorporate clinician validation

Add “question prompts” patients can bring to appointments

Expand to other oncology domains using the same probabilistic engine

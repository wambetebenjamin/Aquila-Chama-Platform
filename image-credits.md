# Image credits — Aquila Chama Platform

All photography lives in `/public/images/` and is sourced from **Pexels** under the
[Pexels License](https://www.pexels.com/license/) — free for commercial use, **no attribution
required**, and **Pexels images carry no watermark**. Attribution is recorded here anyway because
the brief requires it.

No AI-generated imagery is used anywhere in this project. No watermarked, rights-managed or
editorial press photography is used: candidates returned from Getty Images, Citizen Digital,
Eastleigh Voice, WFP and Al Jazeera were reviewed and **rejected** during sourcing because they
are either watermarked previews or licensed editorial content.

## How these were obtained

The sandbox could not reach `api.pexels.com` / `images.pexels.com` directly, so the Pexels API
script described in the brief is shipped for you to run yourself:

```bash
PEXELS_API_KEY=your_key_here npm run fetch:images
```

`scripts/fetch-pexels.mjs` queries the official Pexels API with exactly the eight search strings
from the brief, scores results for East-African relevance, and writes each photo into
`/public/images/` at the filename given below — so the set can be refreshed or upgraded to full
resolution at any time without touching code. The files currently in the repo were sourced
manually from Pexels pages.

## The eight brief queries

1. `African women savings group Kenya meeting`
2. `East African chama women finance`
3. `Kenyan women investment group smiling`
4. `African community meeting savings`
5. `East African women holding money`
6. `African family financial planning`
7. `Kenyan businessman savings account`
8. `East African cooperative group`

## Photo register

| File in `/public/images/` | Pexels photo page | Depicts | Used for |
|---|---|---|---|
| `hero-chama-group.jpg` | https://www.pexels.com/photo/community-gathering-in-rural-african-village-30564957/ | Community gathered outdoors for a meeting in a rural African village | Home hero, right column |
| `community-meeting-circle.jpg` | https://www.pexels.com/photo/community-gathering-in-rural-african-village-30564957/ | People seated on the ground during a community meeting | How it works / CTA |
| `about-community-village.jpg` | https://www.pexels.com/photo/community-gathering-in-rural-african-village-33749805/ | Villagers seated outdoors at a gathering | About section |
| `savings-group-samburu.jpg` | https://pexels.com/photo/photo-of-a-group-of-people-sitting-together-on-the-ground-in-a-village-20853361 | Samburu community gathered outdoors in traditional attire | Features / blog |
| `cooperative-group-men.jpg` | https://www.pexels.com/photo/community-gathering-in-rural-african-village-30564957/ | Men gathered in a rural African village | Cooperative groups |
| `woman-counting-money.jpg` | https://www.pexels.com/search/african%20woman%20money/ (photo 8872369) | African woman counting money at a desk | Contributions feature |
| `women-business-meeting.jpg` | https://www.pexels.com/search/black%20women%20meeting/ (photo 3894383) | Women at a collaborative business meeting | Blog / testimonials |
| `office-team-lagos.jpg` | https://www.pexels.com/photo/group-of-women-sitting-on-couch-3869651/ (photo 30688596) | Professionals in discussion around a table | Blog |
| `women-laptop-collaboration.jpg` | https://pexels.com/photo/group-of-women-sitting-on-couch-3869651/ (photo 3894376) | African women working together around a laptop | Reports feature |
| `hands-counting-coins.jpg` | https://pexels.com/search/black%20woman%20counting%20money/ (photo 8872344) | Hands counting coins on a wooden table | Contributions / table banking |
| `loans-money-bills.jpg` | https://pexels.com/photo/female-hands-caressing-male-hands-holding-money-21418502/ (photo 16341787) | Hands holding banknotes | Loans feature |
| `financial-planning-calculator.jpg` | https://pexels.com/photo/a-woman-holding-smartphone-and-money-7735793 | Woman working out finances with calculator and notes | Investment / blog |
| `portrait-woman-afro.jpg` | https://pexels.com/photo/woman-covering-the-sunlight-4982473 | Smiling Black woman, natural afro | Testimonial avatar |
| `portrait-woman-traditional.jpg` | https://www.pexels.com/photo/portrait-of-woman-in-traditional-african-attire-33968170/ | African woman in traditional attire | Testimonial avatar |
| `portrait-woman-smiling.jpg` | https://pexels.com/photo/portrait-photo-of-woman-smiling-3791554 | Smiling woman in soft natural light | Testimonial avatar |
| `portrait-woman-outdoors.jpg` | https://www.pexels.com/photo/portrait-of-beautiful-african-woman-11440539/ | Young African woman outdoors | Testimonial avatar |
| `kenyan-businessman-suit.jpg` | https://pexels.com/search/african%20man%20suit/ (photo 18274941) | Man in a blue suit, Nairobi, Kenya | Testimonial / pricing |
| `portrait-man-smiling-nairobi.jpg` | https://www.pexels.com/photo/african-man-portrait-with-cap-in-nairobi-kenya-33569489/ | Smiling man in Nairobi | Testimonial avatar |
| `portrait-man-nairobi.jpg` | https://www.pexels.com/photo/african-man-portrait-with-cap-in-nairobi-kenya-33569488/ | African man, Nairobi, Kenya | Testimonial avatar |

## Vector assets carried over from the design source

`/public/images/flaticon-svg/svg/` — `001-wallet`, `002-rich`, `003-notes`, `004-cart`,
`005-megaphone`, `006-credit-card`, `007-piggy-bank`. Shipped with the uploaded zip
(Flaticon basic license). UI icons throughout the app are Lucide, per the brief; these are kept
as source-fidelity assets.

## Standing rule for future edits

Human subjects must be East African. Do not introduce AI-generated faces, stock watermarks, or
photography from agencies that are not free-licence. When adding a photo, add a row above and
re-run nothing else.

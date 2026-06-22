# 📂 Image assets — where to drop your files

The Certifications and Gallery pages are **data-driven**. Until you add real images, each
tile shows a clean placeholder with its title — so the site looks intentional out of the box.
To show your real photos/scans, just drop files with the **exact names below** into these folders.

> Recommended: JPG or PNG, landscape ~1600×1200, under ~500 KB each. The names must match
> the paths in `src/data/certifications.ts` and `src/data/gallery.ts` (edit those if you prefer
> different names).

---

## 1) Certificates → `public/certificates/`
| File | Certificate |
|---|---|
| `cisco-data-analytics.jpg` | Data Analytics — Cisco |
| `cttc-data-analytics.jpg` | Data Analytics — CTTC |
| `iit-ethical-hacking.jpg` | Ethical Hacking — IIT Jammu |
| `udemy-ml-python.jpg` | Machine Learning with Python — Udemy |
| `udemy-advanced-java.jpg` | Advanced Java — Udemy |
| `ncc-a.jpg` · `ncc-b.jpg` · `ncc-c.jpg` | NCC A / B / C |

*Tip:* you can also link a PDF — add `file: '/certificates/xyz.pdf'` to that entry in
`src/data/certifications.ts` and an "Open file" link appears in the viewer.

## 2) Achievements → `public/gallery/achievements/`
`best-internship-award.jpg` · `startup-exposure-2024.jpg` · `best-ncc-cadet-2024.jpg` ·
`research-icevb-2025.jpg` · `mr-fresher-2022.jpg` · `youth-parliament-2022.jpg`

## 3) Events → `public/gallery/events/`
`icevb-2025.jpg` · `startup-exposure-bhubaneswar.jpg` · `ncc-camp.jpg` ·
`youth-parliament.jpg` · `club-events.jpg` · `workshops.jpg`

---

To add a **new** certificate / achievement / event, add an entry to the matching file in
`src/data/` and drop its image here. No component changes needed.

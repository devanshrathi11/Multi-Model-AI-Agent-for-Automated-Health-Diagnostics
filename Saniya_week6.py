def generate_recommendations(findings):
    recs = []

   
    if any('glucose' in f.lower() for f in findings):
        recs.append('Prioritize whole foods; limit refined sugars and sugary drinks')
        recs.append('Aim for regular physical activity most days of the week')

  
    if any(('cholesterol' in f.lower()) or ('ldl' in f.lower()) or ('hdl' in f.lower())
           or ('triglycerides' in f.lower()) or ('non-hdl' in f.lower()) for f in findings):
        recs.append('Increase dietary fiber (vegetables, legumes, oats)')
        recs.append('Favor unsaturated fats (olive oil, nuts); reduce trans/saturated fats')
        recs.append('Consider regular aerobic activity to support lipid profile')

    
    if any('kidney' in f.lower() for f in findings):
        recs.append('Ensure adequate hydration unless medically restricted')
        recs.append('Avoid unnecessary NSAIDs; monitor labs with a healthcare provider')
 # Thyroid-related
    if any('thyroid' in f.lower() or 'tsh' in f.lower() for f in findings):
        recs.append('Discuss symptoms and labs with a healthcare professional')

   
    if any('vitamin d' in f.lower() for f in findings):
        recs.append('Increase safe sun exposure and vitamin D-rich foods')

    if not recs:
        recs.append('Maintain a balanced diet, regular exercise, good sleep, and routine checkups')

   
    seen = set()
    unique_recs = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            unique_recs.append(r)
    return unique_recs

df['Recommendations'] = df['Findings'].apply(generate_recommendations)
df[['PatientID','Findings','Recommendations']].head()

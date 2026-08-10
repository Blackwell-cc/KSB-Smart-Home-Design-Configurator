alter table public_previews
  add constraint public_previews_payload_allowlist
  check (
    jsonb_object_length(public_payload) = 7
    and public_payload ? 'conceptAssetId'
    and public_payload ? 'styleLabel'
    and public_payload ? 'floors'
    and public_payload ? 'bedrooms'
    and public_payload ? 'bathrooms'
    and public_payload ? 'parkingSpaces'
    and public_payload ? 'usableAreaM2'
    and jsonb_typeof(public_payload->'conceptAssetId') = 'string'
    and jsonb_typeof(public_payload->'styleLabel') = 'string'
    and case public_payload->>'conceptAssetId'
      when 'contemporary-warm-luxury' then public_payload->>'styleLabel' = 'Contemporary Warm Luxury'
      when 'modern-tropical-resort' then public_payload->>'styleLabel' = 'Modern Tropical Resort'
      when 'timeless-contemporary-luxury' then public_payload->>'styleLabel' = 'Timeless Contemporary Luxury'
      when 'not-sure' then public_payload->>'styleLabel' = 'ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ'
      else false
    end
    and case when jsonb_typeof(public_payload->'floors') = 'number' then mod((public_payload->>'floors')::numeric, 1) = 0 and (public_payload->>'floors')::numeric between 1 and 3 else false end
    and case when jsonb_typeof(public_payload->'bedrooms') = 'number' then mod((public_payload->>'bedrooms')::numeric, 1) = 0 and (public_payload->>'bedrooms')::numeric between 1 and 12 else false end
    and case when jsonb_typeof(public_payload->'bathrooms') = 'number' then mod((public_payload->>'bathrooms')::numeric, 1) = 0 and (public_payload->>'bathrooms')::numeric between 1 and 15 else false end
    and case when jsonb_typeof(public_payload->'parkingSpaces') = 'number' then mod((public_payload->>'parkingSpaces')::numeric, 1) = 0 and (public_payload->>'parkingSpaces')::numeric between 0 and 10 else false end
    and case when jsonb_typeof(public_payload->'usableAreaM2') = 'number' then (public_payload->>'usableAreaM2')::numeric between 1 and 1500 else false end
  );

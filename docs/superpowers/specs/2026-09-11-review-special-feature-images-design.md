# Review Special Feature Images Design

## Goal

Improve Step 5 review clarity by showing the selected special features with their existing catalog images, and remove the redundant draft-save button from the bottom action bar.

## Approved UI

- Preserve the current Step 5 mosaic, card positions, preview, and overall responsive layout.
- Keep the existing `ส่วนพิเศษที่เลือก` card in its current position and size.
- Replace each checkmark-only text row with a compact vertical media row matching the visual language of `สรุปรายการวัสดุหลัก`.
- Each row contains a 44–48 px image thumbnail, the feature label, and a small selected check overlay on the thumbnail.
- Use the same image source shown for that feature in Step 4 through `SPECIAL_FEATURE_CATALOG`.
- Show up to five rows. When more than five features are selected, retain the existing `+ อีก N รายการ` message.
- Preserve the current empty state when no special feature is selected.

## Data Model

Extend `buildReviewSummary` with `specialFeatures`, where each item has:

```ts
{
  id: SpecialFeatureId;
  label: string;
  imageSrc: string;
}
```

Keep `specialFeatureLabels` for existing consumers and compatibility. Both values derive from `configuration.specialFeatures` and `SPECIAL_FEATURE_CATALOG`.

## Bottom Actions

- Remove only the bottom `บันทึกแบบร่าง` button from `ReviewStep`.
- Keep the global Header `บันทึกแบบร่าง` button and existing draft persistence behavior.
- Change the bottom action grid from three columns to two columns: `ย้อนกลับ` and `ดูสรุปค่าใช้จ่าย`.
- Remove the unused `onSave` prop and `save` icon from `ReviewStep` and its caller.
- Keep accessible labels, keyboard behavior, and navigation callbacks for the remaining buttons.

## Responsive Behavior

- Desktop keeps the current three-column review mosaic.
- Thumbnails and labels must stay within the existing special-feature card without changing its outer dimensions.
- Tablet and mobile follow the existing Step 5 responsive layout and allow the card content to scroll when required.
- Long labels truncate or wrap within their row without causing horizontal overflow.

## Verification

- Review-summary tests verify image metadata for selected features.
- Review-step integration tests verify selected images and confirm the lower draft button is absent while the Header button remains.
- Step 5 E2E verifies the image list, two-button footer, responsive viewports, and unchanged continuation flow.
- Run lint, typecheck, complete unit tests, relevant E2E, production build, and `git diff --check`.


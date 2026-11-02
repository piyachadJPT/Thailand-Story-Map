import { inputClass } from "./fieldStyles";
import FormField from "./FormField";

type SourceFieldProps = {
  /** Required for the crime category. */
  required: boolean;
  defaultValue?: string;
  /** Label used when required; the composer says "หลักฐานอ้างอิง". */
  requiredLabel?: string;
};

/** แหล่งข้อมูลอ้างอิง — optional, but required (and relabelled) for crime stories. */
export default function SourceField({
  required,
  defaultValue,
  requiredLabel = "แหล่งข้อมูลอ้างอิง",
}: SourceFieldProps) {
  return (
    <FormField
      label={required ? `${requiredLabel} (จำเป็น)` : "แหล่งข้อมูลอ้างอิง (ถ้ามี)"}
      htmlFor="story-source"
    >
      <input
        id="story-source"
        name="sourceUrl"
        type="url"
        defaultValue={defaultValue}
        placeholder="https://…"
        required={required}
        className={inputClass}
      />
    </FormField>
  );
}

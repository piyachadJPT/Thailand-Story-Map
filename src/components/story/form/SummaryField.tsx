import { fieldClass } from "./fieldStyles";
import FormField from "./FormField";

type SummaryFieldProps = {
  defaultValue?: string;
  placeholder?: string;
};

export default function SummaryField({ defaultValue, placeholder }: SummaryFieldProps) {
  return (
    <FormField label="สรุปเรื่อง" htmlFor="story-summary">
      <textarea
        id="story-summary"
        name="summary"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        minLength={10}
        maxLength={500}
        className={`${fieldClass} min-h-28 py-3`}
      />
    </FormField>
  );
}

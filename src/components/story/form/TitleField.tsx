import { inputClass } from "./fieldStyles";
import FormField from "./FormField";

type TitleFieldProps = {
  defaultValue?: string;
  placeholder?: string;
};

export default function TitleField({ defaultValue, placeholder }: TitleFieldProps) {
  return (
    <FormField label="ชื่อเรื่อง" htmlFor="story-title">
      <input
        id="story-title"
        name="title"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        minLength={3}
        maxLength={200}
        className={`${inputClass} font-heading`}
      />
    </FormField>
  );
}

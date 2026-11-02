import { inputClass } from "./fieldStyles";
import FormField from "./FormField";

type CoordinateFieldsProps = {
  latitude: string;
  longitude: string;
  onChange: (next: { latitude: string; longitude: string }) => void;
};

/** ละติจูด / ลองจิจูด inputs (edit page), filled by search or current location. */
export default function CoordinateFields({ latitude, longitude, onChange }: CoordinateFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="ละติจูด" htmlFor="story-latitude">
        <input
          id="story-latitude"
          name="latitude"
          type="number"
          step="any"
          min={-90}
          max={90}
          required
          value={latitude}
          onChange={(event) => onChange({ latitude: event.target.value, longitude })}
          className={inputClass}
        />
      </FormField>
      <FormField label="ลองจิจูด" htmlFor="story-longitude">
        <input
          id="story-longitude"
          name="longitude"
          type="number"
          step="any"
          min={-180}
          max={180}
          required
          value={longitude}
          onChange={(event) => onChange({ latitude, longitude: event.target.value })}
          className={inputClass}
        />
      </FormField>
    </div>
  );
}

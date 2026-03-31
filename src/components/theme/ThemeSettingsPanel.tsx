interface Props {
  name: string;
  setName: (v: string) => void;
}

export const ThemeSettingsPanel = ({ name, setName }: Props) => (
  <div className="panel-card">
    <div className="panel-title">
      <span>⚙</span> Theme Settings
    </div>
    <div className="section-label">THEME NAME</div>
    <input
      value={name}
      onChange={e => setName(e.target.value)}
      className="color-input w-full"
      style={{ textTransform: "none" }}
    />
  </div>
);

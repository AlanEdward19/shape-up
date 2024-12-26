const profiles = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `Perfil ${i + 1}`,
}));

const Stories = () => {
  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
            <div className="w-full h-full rounded-full bg-secondary"></div>
          </div>
          <span className="text-sm text-muted-foreground">{profile.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Stories;
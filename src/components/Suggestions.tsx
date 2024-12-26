const suggestions = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Perfil ${i + 1}`,
  mutualFriends: Math.floor(Math.random() * 20) + 1,
}));

const Suggestions = () => {
  return (
    <div className="bg-secondary rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Você talvez conheça</h2>
      <div className="space-y-4">
        {suggestions.map((profile) => (
          <div key={profile.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div className="flex-1">
              <h3 className="font-medium">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.mutualFriends} amigos em comum
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
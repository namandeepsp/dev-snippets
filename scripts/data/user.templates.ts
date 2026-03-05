export type UserTemplate = {
  email: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl?: string;
};

export const USER_TEMPLATES: UserTemplate[] = [
  {
    email: 'namandeepsp@gmail.com',
    name: 'Tony Stark',
    username: 'namandeepsp',
    bio: 'Genius, billionaire, playboy, philanthropist. Building the future with code and arc reactors.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ironman',
  },
  {
    email: 'namand.official@gmail.com',
    name: 'Peter Parker',
    username: 'namand.official',
    bio: 'Your friendly neighborhood developer. With great code comes great responsibility.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spiderman',
  },
  {
    email: 'sardarparmar111@gmail.com',
    name: 'Bruce Banner',
    username: 'sardarparmar111',
    bio: 'Scientist by day, code smasher by night. You wouldn\'t like me when my code doesn\'t compile.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hulk',
  },
];

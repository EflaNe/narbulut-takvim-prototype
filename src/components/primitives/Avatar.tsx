import type { User } from '../../lib/domain/types';

export function Avatar({ user, small }: { user: User; small?: boolean }) {
  return (
    <span className={`avatar${small ? ' avatar--sm' : ''}`} aria-hidden="true">
      {user.initials}
    </span>
  );
}

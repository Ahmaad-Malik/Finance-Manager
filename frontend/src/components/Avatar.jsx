import { getUploadUrl } from '../utils/url';

const getInitials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function Avatar({ name, src, className = '' }) {
  const imageUrl = src ? getUploadUrl(src) : null;

  return (
    <div className={className} aria-hidden="true">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="avatar-img" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

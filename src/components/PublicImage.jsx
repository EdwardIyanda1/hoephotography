import { useApi } from "../lib/api";
export default function PublicImage({ category, index = 0, ...props }) {
  const { data } = useApi("/public/media");
  const images = data?.filter(
    (m) =>
      m.mime.startsWith("image/") && (!category || m.category === category),
  );
  const item = images?.[index];
  return item ? (
    <img
      {...props}
      src={item.url}
      alt={props.alt || item.caption || item.name}
    />
  ) : null;
}

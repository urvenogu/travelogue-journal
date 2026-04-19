function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

export const VideoBlock = ({ url }: { url: string }) => {
  const id = getYouTubeId(url);
  if (!id) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block my-6 underline">
        Watch the video →
      </a>
    );
  }
  return (
    <figure className="my-6 aspect-video w-full overflow-hidden rounded-sm shadow-soft bg-muted">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Embedded video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="size-full"
      />
    </figure>
  );
};

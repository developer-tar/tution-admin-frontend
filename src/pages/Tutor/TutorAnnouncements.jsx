import TutorListPage from "./TutorListPage";

const transform = (row) => ({
  id: row.id,
  title: row.title ?? "-",
  message: row.message ? (row.message.length > 50 ? row.message.slice(0, 50) + "…" : row.message) : "-",
  created_at: row.created_at ?? "-",
});

export default function TutorAnnouncements() {
  return (
    <TutorListPage
      title="Announcements"
      endpoint="tutor/announcements"
      columns={{ id: "ID", title: "Title", message: "Message", created_at: "Date" }}
      transformRow={transform}
    />
  );
}

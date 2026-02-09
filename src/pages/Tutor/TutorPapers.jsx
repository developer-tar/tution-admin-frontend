import TutorListPage from "./TutorListPage";

export default function TutorPapers() {
  return (
    <TutorListPage
      title="Papers"
      endpoint="tutor/papers"
      columns={{ id: "ID", name: "Name", slug: "Slug", status: "Status" }}
    />
  );
}

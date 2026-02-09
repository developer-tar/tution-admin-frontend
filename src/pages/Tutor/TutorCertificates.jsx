import TutorListPage from "./TutorListPage";

const transform = (row) => ({
  id: row.id,
  student: row.student ? `${row.student.first_name || ""} ${row.student.last_name || ""}`.trim() : "-",
  certificate_number: row.certificate_number ?? "-",
  issued_date: row.issued_date ?? "-",
});

export default function TutorCertificates() {
  return (
    <TutorListPage
      title="Certificates"
      endpoint="tutor/certificates"
      columns={{ id: "ID", student: "Student", certificate_number: "Certificate #", issued_date: "Issued" }}
      transformRow={transform}
    />
  );
}

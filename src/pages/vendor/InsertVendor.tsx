import { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { TextInput, Label, Textarea, Button, Select } from "flowbite-react";

interface Kontak {
  jenis_kontak: string;
  isi_kontak: string;
  is_primary: boolean;
}

interface FormState {
  nama_vendor: string;
  alamat: string;
  status: string;
  kontak: Kontak[];
}

export default function CreateVendorForm() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<FormState>({
    nama_vendor: "",
    alamat: "",
    status: "Aktif",
    kontak: [{ jenis_kontak: "email", isi_kontak: "", is_primary: true }],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleKontakChange = (index: number, field: keyof Kontak, value: string | boolean) => {
    const updated = [...form.kontak];
    updated[index][field] = value as never;
    setForm({ ...form, kontak: updated });
  };

  const addKontak = () => {
    setForm({
      ...form,
      kontak: [...form.kontak, { jenis_kontak: "email", isi_kontak: "", is_primary: false }],
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof FormState)[] = ["nama_vendor", "alamat", "status"];
    for (const field of requiredFields) {
      if (!form[field]) {
        Swal.fire("Gagal", `Field ${field.replace("_", " ")} wajib diisi`, "warning");
        return;
      }
    }

    const payload = {
      vendor: {
        nama_vendor: form.nama_vendor,
        alamat: form.alamat,
        status: form.status,
      },
      kontak: form.kontak,
    };

    try {
      await axios.post("http://localhost:6969/vendor-kontak/insert", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire("Berhasil", "Vendor berhasil ditambahkan!", "success");
      setForm({
        nama_vendor: "",
        alamat: "",
        status: "Aktif",
        kontak: [{ jenis_kontak: "email", isi_kontak: "", is_primary: true }],
      });
    } catch {
      Swal.fire("Error", "Gagal menambahkan vendor", "error");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tambah Vendor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label value="Nama Vendor *" />
          <TextInput name="nama_vendor" value={form.nama_vendor} onChange={handleChange} />
        </div>
        <div>
          <Label value="Alamat *" />
          <Textarea name="alamat" value={form.alamat} onChange={handleChange} />
        </div>
        <div>
          <Label value="Status *" />
          <Select name="status" value={form.status} onChange={handleChange}>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </Select>
        </div>

        <h2 className="text-lg font-semibold mt-6">Kontak Vendor</h2>
        {form.kontak.map((kontak, index) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <div>
              <Label value="Jenis Kontak" />
              <Select
                value={kontak.jenis_kontak}
                onChange={(e) => handleKontakChange(index, "jenis_kontak", e.target.value)}
              >
                <option value="email">Email</option>
                <option value="telepon">Telepon</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="lainnya">Lainnya</option>
              </Select>
            </div>
            <div>
              <Label value="Isi Kontak" />
              <TextInput
                value={kontak.isi_kontak}
                onChange={(e) => handleKontakChange(index, "isi_kontak", e.target.value)}
              />
            </div>
            <div>
              <Label value="Sebagai Kontak Utama?" />
              <Select
                value={kontak.is_primary ? "true" : "false"}
                onChange={(e) => handleKontakChange(index, "is_primary", e.target.value === "true")}
              >
                <option value="false">Tidak</option>
                <option value="true">Ya</option>
              </Select>
            </div>
          </div>
        ))}

        <Button color="gray" type="button" onClick={addKontak}>
          Tambah Kontak
        </Button>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}

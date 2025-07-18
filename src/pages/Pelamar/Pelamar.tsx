import { createContext, useContext, useState } from "react";
import { Referensi } from "./Referensi";
import {
    PendidikanFormal,
    PendidikanNonFormal,
    PenguasaanBahasa,
} from "./RiwayatPendidikan";
import { IdentitasDiri } from "./IdentitasDiri";
import { FormState as KeluargaForm } from "./DataKeluarga";
import { PengalamanKerja } from "./PengalamanKerja";

interface PelamarData {
    identitas?: IdentitasDiri;
    keluarga?: KeluargaForm;
    pendidikan?: {
        formal: PendidikanFormal[];
        nonFormal: PendidikanNonFormal[];
        bahasa: PenguasaanBahasa[];
    };
    pengalamanKerja?: PengalamanKerja[];
    referensi?: Referensi[];
}

interface PelamarContextType {
    data: PelamarData;
    setData: React.Dispatch<React.SetStateAction<PelamarData>>;
}

const PelamarContext = createContext<PelamarContextType | undefined>(undefined);

export const PelamarProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<PelamarData>({});
    return (
        <PelamarContext.Provider value={{ data, setData }}>
            {children}
        </PelamarContext.Provider>
    );
};

export const usePelamar = () => {
    const context = useContext(PelamarContext);
    if (!context) {
        throw new Error("usePelamar harus digunakan di dalam PelamarProvider");
    }
    return context;
};

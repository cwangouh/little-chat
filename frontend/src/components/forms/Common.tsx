import React, { type ReactNode } from "react";
import { Link, type FetcherWithComponents, type LinkProps } from "react-router-dom";


export const BoldLink: React.FC<LinkProps & React.RefAttributes<HTMLAnchorElement>> =
    ({ to, children }) => {
        return <>
            <Link to={to} className="font-bold underline hover:text-gray-700">{children}</Link>
        </>
    }

interface InputFieldProps {
    id: string;
    label: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    type = "text",
    value,
    onChange,
}) => (
    <div className="flex items-center gap-3">
        <label htmlFor={id} className="w-24 text-right font-medium">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            className="flex-1 px-3 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
    </div>
);

interface FormContainerProps {
    title: string;
    children: ReactNode;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const FormContainer: React.FC<FormContainerProps> = ({
    title,
    children,
}) => {
    return (
        <div className="max-w-sm mx-auto bg-amber-100 rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold underline mb-4 text-center">{title}</h3>
            {children}
        </div>
    );
};

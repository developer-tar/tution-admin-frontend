import { useState } from "react";
import {
    Box,
    Grid,
    Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify"

import api from "../../../api";
import InputField from "../../../components/InputField";
import DropdownField from "../../../components/DropdownField";
import SubmitButton from "../../../components/SubmitButton";

const dummyEmails = [
    { id: "user1@example.com", name: "tarun@example.com" },
    { id: "user2@example.com", name: "anjali@example.com" },
    { id: "admin@example.com", name: "rohan@example.com" },
];

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            email: "",
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post("/change-password", data); // Adjust endpoint as needed
            toast.success("Password changed successfully!");
            reset();
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors) {
                Object.entries(backendErrors).forEach(([field, messages]) => {
                    setError(field, {
                        type: "server",
                        message: messages[0],
                    });
                });
            } else {
                const message = err.response?.data?.message || "Something went wrong";
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>
                Change Password
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <DropdownField
                        control={control}
                        name="email"
                        label="Email"
                        options={dummyEmails}
                        error={errors.email}
                        onChange={(value) => setValue("email", value)}
                    />

                    <InputField
                        control={control}
                        name="current_password"
                        label="Current Password"
                        type="password"
                        error={errors.current_password}
                    />

                    <InputField
                        control={control}
                        name="new_password"
                        label="New Password"
                        type="password"
                        error={errors.new_password}
                    />

                    <InputField
                        control={control}
                        name="new_password_confirmation"
                        label="Confirm New Password"
                        type="password"
                        error={errors.new_password_confirmation}
                    />

                    <SubmitButton
                        loading={loading}
                        label="Update Password"
                    />
                </Grid>
            </form>
        </Box>
    );
};

export default ChangePassword;

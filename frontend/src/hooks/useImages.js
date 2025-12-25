import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_Base = 'http://localhost:3000/api';

const fetchImages = async () => {
    const { data } = await axios.get(`${API_Base}/images`);
    return data;
};

const fetchConfig = async () => {
    const { data } = await axios.get(`${API_Base}/config`);
    return data;
};

const updateConfig = async (newPath) => {
    const { data } = await axios.post(`${API_Base}/config`, { path: newPath });
    return data;
};

export const useImages = () => {
    return useQuery({
        queryKey: ['images'],
        queryFn: fetchImages,
    });
};

export const useConfig = () => {
    const queryClient = useQueryClient();

    const configQuery = useQuery({
        queryKey: ['config'],
        queryFn: fetchConfig,
    });

    const updateConfigMutation = useMutation({
        mutationFn: updateConfig,
        onSuccess: () => {
            queryClient.invalidateQueries(['config']);
            queryClient.invalidateQueries(['images']);
        },
    });

    return {
        config: configQuery.data,
        isLoading: configQuery.isLoading,
        updatePath: updateConfigMutation.mutate,
        isUpdating: updateConfigMutation.isPending,
    };
};

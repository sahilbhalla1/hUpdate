let navigateFn = null;

export const setNavigate = (navigate) => {
    navigateFn = navigate;
};

export const navigate = (path, options = {}) => {
    if (navigateFn) {
        navigateFn(path, options);
    }
};
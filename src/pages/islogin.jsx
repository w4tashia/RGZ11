const islogin = () => {
    const notexist = !localStorage.getItem("access_token")
    return (!notexist)
};

export default islogin()

const generateAppointCode = () => {

    const generateCode = Math.floor(1000 + Math.random() * 9000)
    return `CK-${generateCode}`;
}
export default generateAppointCode
import slugify from "slugify";

const generateDepartmentCode = (name) => {
    const departmantCode = slugify(name, {
        replacement: ' ',
        lower: false,
        upper: true,
        strict: true,
        locale: 'vi'
    });
    const shortDepartmentCode = departmantCode.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase();
    return `K-${shortDepartmentCode}`;
}
export default generateDepartmentCode;
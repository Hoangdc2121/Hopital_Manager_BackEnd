import { BadrequestException } from "../common/helpers/exception.helper.js";

const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!regex.test(password)) {
        throw new BadrequestException(
            "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt"
        )
    }
}

export default validatePassword
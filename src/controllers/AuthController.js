import Employee from '../models/EmployeeModel.js';
import { comparePassword } from '../utils/Bcrypt.js';
import { generateToken } from '../utils/JWT.js';


const login = async ( req, res, next ) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Employee.findOne({email}).select("+password");
    
    if (!admin) {
      throw new Error("Admin not found");
    };

    const isPasswordMatched = await comparePassword(password, admin.password);

    if (!isPasswordMatched) {
      throw new Error("Password does not match");
    };

    const tokenPayload = {
      _id: admin._id,
      emId: admin.emId,
    };

    const token = generateToken(tokenPayload);

    const empResponse = admin.toObject ? admin.toObject() : admin.toJSON();
    delete empResponse.password;
    delete empResponse.deletedAt;
    delete empResponse?.id;

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Admin logged in sucessfully",
      access_token: token,
      data: empResponse,
    });

  } catch(err) {
    console.error(`Login error: ${err.name} - ${err.message}`);
    next(err);
  };
};

export default login;

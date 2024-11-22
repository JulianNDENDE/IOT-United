import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/ROUTES';
import { login } from '../../api/auth/login';
import { useUser } from '../../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      const user = await login(email, password);
      setUser(user);
      navigate(ROUTES.PATHS.dashboard);
      console.log('Login successful:', user);
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1 className="text-center">Login</h1>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <div className="text-center">
              <Button variant="primary" onClick={handleLogin}>
                Login
              </Button>
            </div>
          </Form>

          <div className="mt-3">
            <span>Don't have an account? </span>
            <Link to={ROUTES.PATHS.register}>Register here</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

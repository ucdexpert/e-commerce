#!/usr/bin/env python3
"""
Test Runner Script for E-Shop Platform
========================================

This script runs all tests for both backend and frontend.

Usage:
    python run_tests.py              # Run all tests
    python run_tests.py --backend    # Run backend tests only
    python run_tests.py --frontend   # Run frontend tests only
    python run_tests.py --coverage   # Run with coverage report
    python run_tests.py --watch      # Run in watch mode (frontend)
"""

import subprocess
import sys
import os
from pathlib import Path


def print_header(text: str):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")


def run_backend_tests(coverage: bool = False):
    """Run backend pytest tests"""
    print_header("🐍 Running Backend Tests")
    
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    cmd = [sys.executable, "-m", "pytest"]
    
    if coverage:
        cmd.extend([
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-report=html:htmlcov"
        ])
    else:
        cmd.append("-v")
    
    cmd.append("tests/")
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print("\n✅ Backend tests passed!")
        if coverage:
            print(f"📊 Coverage report available at: {backend_dir / 'htmlcov' / 'index.html'}")
    else:
        print("\n❌ Backend tests failed!")
    
    return result.returncode


def run_frontend_tests(watch: bool = False, coverage: bool = False):
    """Run frontend Jest tests"""
    print_header("⚛️  Running Frontend Tests")
    
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    cmd = ["npm", "test"]
    
    if watch:
        cmd.append("--watch")
    elif coverage:
        cmd.append("--coverage")
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print("\n✅ Frontend tests passed!")
        if coverage:
            print(f"📊 Coverage report available at: {frontend_dir / 'coverage' / 'index.html'}")
    else:
        print("\n❌ Frontend tests failed!")
    
    return result.returncode


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Run E-Shop tests")
    parser.add_argument("--backend", action="store_true", help="Run backend tests only")
    parser.add_argument("--frontend", action="store_true", help="Run frontend tests only")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage report")
    parser.add_argument("--watch", action="store_true", help="Run frontend tests in watch mode")
    
    args = parser.parse_args()
    
    # If no specific option, run all
    run_all = not (args.backend or args.frontend)
    
    backend_result = 0
    frontend_result = 0
    
    try:
        if run_all or args.backend:
            backend_result = run_backend_tests(coverage=args.coverage)
        
        if run_all or args.frontend:
            frontend_result = run_frontend_tests(watch=args.watch, coverage=args.coverage)
        
        # Summary
        print_header("📊 Test Summary")
        
        if run_all or args.backend:
            status = "✅ Passed" if backend_result == 0 else "❌ Failed"
            print(f"Backend Tests:  {status}")
        
        if run_all or args.frontend:
            status = "✅ Passed" if frontend_result == 0 else "❌ Failed"
            print(f"Frontend Tests: {status}")
        
        print()
        
        if backend_result == 0 and frontend_result == 0:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed!")
            return 1
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
